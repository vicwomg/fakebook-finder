import {
  faCheck,
  faEdit,
  faGripVertical,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TitleBar from "../components/TitleBar";
import "../styles/Global.css";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylists,
  Playlist,
  renamePlaylist,
  reorderPlaylistSongs,
} from "../utils/playlist";

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [dragOverIndex, setDragOverIndex] = useState<{
    pid: string;
    index: number;
  } | null>(null);
  const [recentlyMoved, setRecentlyMoved] = useState<{
    pid: string;
    index: number;
  } | null>(null);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const flashTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const loadPlaylists = () => {
    setPlaylists(getPlaylists());
  };

  useEffect(() => {
    loadPlaylists();

    const handleStorage = (e: Event) => {
      loadPlaylists();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      loadPlaylists();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(id);
      loadPlaylists();
    }
  };

  const handleStartEdit = (playlist: Playlist) => {
    setEditingPlaylistId(playlist.id);
    setEditName(playlist.name);
  };

  const handleCancelEdit = () => {
    setEditingPlaylistId(null);
    setEditName("");
  };

  const handleSaveEdit = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editName.trim()) {
      renamePlaylist(id, editName.trim());
      loadPlaylists();
      setEditingPlaylistId(null);
      setEditName("");
    }
  };

  return (
    <>
      <TitleBar />
      <div className="container">
        <h3>Playlists</h3>
        <div style={{ padding: "10px", marginBottom: "20px" }}>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter new playlist name..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                color: "#333",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              className="blue-button"
              style={{ padding: "8px 16px" }}
            >
              Create
            </button>
          </form>
        </div>

        <div style={{ flex: 1 }}>
          {playlists.length === 0 ? (
            <p
              style={{
                color: "#666",
                textAlign: "center",
                fontStyle: "italic",
                marginTop: "40px",
              }}
            >
              No playlists have been created yet.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {playlists.map((playlist) => (
                <li
                  key={playlist.id}
                  style={{
                    marginBottom: "20px",
                    padding: "15px 15px 0px",
                    borderRadius: "8px",
                    background: "#f9f9f9",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                    }}
                  >
                    {editingPlaylistId === playlist.id ? (
                      <form
                        onSubmit={(e) => handleSaveEdit(playlist.id, e)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          gap: "10px",
                        }}
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: "6px",
                            fontSize: "16px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                        <button
                          type="button"
                          className="unstyled-button"
                          onClick={() => handleSaveEdit(playlist.id)}
                          style={{ color: "green", padding: "5px" }}
                          title="Save name"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          type="button"
                          className="unstyled-button"
                          onClick={handleCancelEdit}
                          style={{ color: "#666", padding: "5px" }}
                          title="Cancel"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                          {playlist.songs.length > 0 ? (
                            <Link
                              to={{
                                pathname: `/source/${encodeURIComponent(
                                  playlist.songs[0].source,
                                )}/${playlist.songs[0].page}`,
                                state: {
                                  playlistId: playlist.id,
                                  songIndex: 0,
                                  title: playlist.songs[0].title,
                                },
                              }}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              {playlist.name}
                            </Link>
                          ) : (
                            playlist.name
                          )}
                        </div>
                        <div>
                          <button
                            className="unstyled-button"
                            onClick={() => handleStartEdit(playlist)}
                            style={{ color: "#007bff", padding: "5px" }}
                            title="Rename playlist"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="unstyled-button"
                            onClick={(e) => handleDelete(playlist.id, e)}
                            style={{ color: "#ff4444", padding: "5px" }}
                            title="Delete playlist"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {playlist.songs.length === 0 ? (
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#888",
                        fontStyle: "italic",
                        padding: "10px",
                      }}
                    >
                      Empty playlist
                    </div>
                  ) : (
                    <div style={{ marginTop: "5px" }}>
                      {playlist.songs.map((song, idx) => (
                        <React.Fragment key={idx}>
                          {dragOverIndex &&
                            dragOverIndex.pid === playlist.id &&
                            dragOverIndex.index === idx && (
                              <div
                                style={{
                                  height: "2px",
                                  background: "#007bff",
                                  margin: "2px 0",
                                }}
                              />
                            )}
                          <Link
                            to={{
                              pathname: `/source/${encodeURIComponent(song.source)}/${song.page}`,
                              state: {
                                playlistId: playlist.id,
                                songIndex: idx,
                                title: song.title,
                              },
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverIndex({
                                pid: playlist.id,
                                index: idx,
                              });
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverIndex(null);
                              const fromPlaylistId =
                                e.dataTransfer.getData("playlistId");
                              const fromIndex = parseInt(
                                e.dataTransfer.getData("fromIndex"),
                              );

                              if (
                                fromPlaylistId === playlist.id &&
                                fromIndex !== idx
                              ) {
                                reorderPlaylistSongs(
                                  playlist.id,
                                  fromIndex,
                                  idx,
                                );
                                loadPlaylists();
                                const finalIndex =
                                  fromIndex < idx ? idx - 1 : idx;
                                if (flashTimeoutRef.current)
                                  clearTimeout(flashTimeoutRef.current);
                                setRecentlyMoved({
                                  pid: playlist.id,
                                  index: finalIndex,
                                });
                                flashTimeoutRef.current = setTimeout(() => {
                                  setRecentlyMoved(null);
                                  flashTimeoutRef.current = null;
                                }, 1500);
                              }
                            }}
                            className={
                              recentlyMoved?.pid === playlist.id &&
                              recentlyMoved?.index === idx
                                ? "recently-moved"
                                : ""
                            }
                            style={{
                              display: "block",
                              fontSize: "16px",
                              color: "#333",
                              textDecoration: "none",
                              padding: "8px 0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              textAlign: "left",
                              cursor: "pointer",
                              opacity:
                                dragOverIndex?.pid === playlist.id &&
                                dragOverIndex?.index === idx
                                  ? 0.5
                                  : 1,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#888",
                                    marginRight: "10px",
                                    fontSize: "14px",
                                    display: "inline-block",
                                    width: "25px",
                                    textAlign: "right",
                                  }}
                                >
                                  {idx + 1}.
                                </span>
                                {song.title}
                              </div>

                              <button
                                className="unstyled-button"
                                style={{ color: "lightgrey", cursor: "grab" }}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData(
                                    "playlistId",
                                    playlist.id,
                                  );
                                  e.dataTransfer.setData(
                                    "fromIndex",
                                    idx.toString(),
                                  );
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faGripVertical}
                                  style={{ marginLeft: "10px" }}
                                />
                              </button>
                            </div>
                          </Link>
                        </React.Fragment>
                      ))}
                      <div
                        style={{ height: "20px" }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIndex({
                            pid: playlist.id,
                            index: playlist.songs.length,
                          });
                        }}
                        onDragLeave={() => {
                          setDragOverIndex(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverIndex(null);
                          const fromPlaylistId =
                            e.dataTransfer.getData("playlistId");
                          const fromIndex = parseInt(
                            e.dataTransfer.getData("fromIndex"),
                          );
                          if (
                            fromPlaylistId === playlist.id &&
                            fromIndex !== playlist.songs.length
                          ) {
                            reorderPlaylistSongs(
                              playlist.id,
                              fromIndex,
                              playlist.songs.length,
                            );
                            loadPlaylists();
                            const finalIndex =
                              fromIndex < playlist.songs.length
                                ? playlist.songs.length - 1
                                : playlist.songs.length;
                            if (flashTimeoutRef.current)
                              clearTimeout(flashTimeoutRef.current);
                            setRecentlyMoved({
                              pid: playlist.id,
                              index: finalIndex,
                            });
                            flashTimeoutRef.current = setTimeout(() => {
                              setRecentlyMoved(null);
                              flashTimeoutRef.current = null;
                            }, 1500);
                          }
                        }}
                      >
                        {dragOverIndex &&
                          dragOverIndex.pid === playlist.id &&
                          dragOverIndex.index === playlist.songs.length && (
                            <div
                              style={{
                                height: "2px",
                                background: "#007bff",
                                margin: "2px 0",
                              }}
                            />
                          )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Playlists;
