import {
  faCheck,
  faPlus,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/Global.css";
import {
  addSongToPlaylist,
  createPlaylist,
  getPlaylists,
  Playlist,
  Song,
} from "../utils/playlist";

const AddToPlaylistButton = ({ song }: { song: Song }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [added, setAdded] = useState(false);
  const [addedPlaylistName, setAddedPlaylistName] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ top: 0, left: 0 });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        // Check if click is inside the menu (which is now in a portal) or the button
        const target = event.target as HTMLElement;

        if (buttonRef.current && buttonRef.current.contains(target)) {
          return; // Let handleToggle handle it
        }

        if (menuRef.current && menuRef.current.contains(target)) {
          return; // Click inside menu
        }

        setShowMenu(false);
      }
    };

    const handleScroll = (event: Event) => {
      if (showMenu) {
        // Ignore scroll events that happen inside the menu (like input scrolling)
        if (
          menuRef.current &&
          event.target instanceof Node &&
          menuRef.current.contains(event.target)
        ) {
          return;
        }
        setShowMenu(false);
      }
    };

    // Use mousedown to capture click before onclick? or click.
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // Close inside scroll
    window.addEventListener("resize", () => setShowMenu(false));

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", () => setShowMenu(false));
    };
  }, [showMenu, song.source, song.page]);

  const loadPlaylists = () => {
    setPlaylists(getPlaylists());
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMenu) {
      loadPlaylists();
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        // Position: bottom right aligned with button, or bottom left?
        // Existing was: absolute, top: 100% (of button), right: 0.
        // So top = rect.bottom, right = window.width - rect.right (relative to body... tricky).
        // Easier: Left = rect.right - menuWidth.
        const MENU_HEIGHT = 200; // estimated max height
        const spaceBelow = window.innerHeight - rect.bottom;
        const showAbove = spaceBelow < MENU_HEIGHT;

        if (showAbove) {
          setMenuPosition({
            bottom: window.innerHeight - rect.top,
            left: rect.left - (200 - rect.width),
            top: undefined,
          });
        } else {
          setMenuPosition({
            top: rect.bottom,
            left: rect.left - (200 - rect.width),
            bottom: undefined,
          });
        }
      }
    }
    setShowMenu(!showMenu);
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      addSongToPlaylist(newPlaylist.id, song);
      setNewPlaylistName("");
      setAdded(true);
      setAddedPlaylistName(newPlaylist.name);
      setTimeout(() => {
        setAdded(false);
        setShowMenu(false);
      }, 1500);
    }
  };

  const handleAddToPlaylist = (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const playlist = playlists.find((p) => p.id === playlistId);
    addSongToPlaylist(playlistId, song);
    setAdded(true);
    setAddedPlaylistName(playlist ? playlist.name : "");
    setTimeout(() => {
      setAdded(false);
      setShowMenu(false);
    }, 1500);
  };

  const menu = (
    <div
      ref={menuRef}
      id={`playlist-menu-${song.source}-${song.page}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: menuPosition.top !== undefined ? menuPosition.top : "auto",
        bottom:
          menuPosition.bottom !== undefined ? menuPosition.bottom : "auto",
        left: menuPosition.left,
        background: "white",
        color: "#333",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        zIndex: 9999, // High z-index for portal
        width: "200px",
        padding: "5px",
        textAlign: "left",
      }}
    >
      {added ? (
        <div
          style={{
            padding: "10px",
            color: "green",
            textAlign: "center",
            fontSize: "13px",
          }}
        >
          <div>
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: 5 }} />
            Added to:{" "}
            <span style={{ fontWeight: "bold" }}>{addedPlaylistName}</span>
          </div>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {playlists.length > 0 && (
              <div
                style={{
                  padding: "5px 5px 0",
                  marginBottom: "5px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#666",
                }}
              >
                Add to:
              </div>
            )}
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="unstyled-button"
                onClick={(e) => handleAddToPlaylist(playlist.id, e)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "5px 10px",
                  fontSize: "14px",
                  color: "#333",
                  background: "transparent",
                }}
              >
                <FontAwesomeIcon
                  icon={faPlusCircle}
                  style={{ color: "green", marginRight: "8px" }}
                />
                {playlist.name}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleCreateAndAdd}
            style={{
              borderTop: "1px solid #eee",
              padding: "5px",
              marginTop: "5px",
            }}
          >
            <div
              style={{
                padding: "0 0 5px",
                marginBottom: "5px",
                fontSize: "11px",
                fontWeight: "bold",
                color: "#666",
              }}
            >
              Add to new playlist:
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                style={{
                  padding: "4px",
                  fontSize: "12px",
                  width: "100%",
                  boxSizing: "border-box",
                  color: "#333",
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                className="blue-button"
                style={{ padding: "4px 8px", fontSize: "12px" }}
              >
                create
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );

  return (
    <div
      className="add-to-playlist-container"
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        ref={buttonRef}
        className="unstyled-button"
        onClick={handleToggle}
        title="Add to playlist"
        style={{ color: "#bbb" }}
      >
        <FontAwesomeIcon icon={faPlus} size="sm" />
      </button>

      {showMenu && createPortal(menu, document.body)}
    </div>
  );
};

export default AddToPlaylistButton;
