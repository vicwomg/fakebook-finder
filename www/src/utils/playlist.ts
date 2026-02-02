export type Song = {
  title: string;
  page: string;
  source: string;
};

export type Playlist = {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const PLAYLIST_STORAGE_KEY = "playlists";

export const getPlaylists = (): Playlist[] => {
  try {
    const stored = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Error reading playlists:", error);
    return [];
  }
};

export const savePlaylists = (playlists: Playlist[]) => {
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists));
    // Dispatch storage event for cross-tab/same-tab sync
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.warn("Error saving playlists:", error);
  }
};

export const createPlaylist = (name: string): Playlist => {
  const playlists = getPlaylists();
  const newPlaylist: Playlist = {
    id: generateId(),
    name,
    songs: [],
    createdAt: Date.now(),
  };
  savePlaylists([...playlists, newPlaylist]);
  return newPlaylist;
};

export const deletePlaylist = (id: string) => {
  const playlists = getPlaylists();
  const updated = playlists.filter((p) => p.id !== id);
  savePlaylists(updated);
};

export const addSongToPlaylist = (playlistId: string, song: Song) => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

  if (playlistIndex === -1) return;

  // Check if song already exists in this playlist
  const songExists = playlists[playlistIndex].songs.some(
    (s) =>
      s.source === song.source &&
      s.page === song.page &&
      s.title === song.title
  );

  if (!songExists) {
    playlists[playlistIndex].songs.push(song);
    savePlaylists(playlists);
  }
};

export const removeSongFromPlaylist = (playlistId: string, songIndex: number) => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

  if (playlistIndex === -1) return;

  if (songIndex >= 0 && songIndex < playlists[playlistIndex].songs.length) {
    playlists[playlistIndex].songs.splice(songIndex, 1);
    savePlaylists(playlists);
  }
};

export const reorderPlaylistSongs = (
  playlistId: string,
  fromIndex: number,
  toIndex: number
) => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

  if (playlistIndex === -1) return;

  const songs = playlists[playlistIndex].songs;
  if (
    fromIndex < 0 ||
    fromIndex >= songs.length ||
    toIndex < 0 ||
    toIndex > songs.length // Allow toIndex to be songs.length (append)
  ) {
    return;
  }

  // Adjust toIndex if we are moving an item from a lower index to a higher index,
  // because removing the item first will shift subsequent items up.
  const adjusteToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;

  const [movedSong] = songs.splice(fromIndex, 1);
  songs.splice(adjusteToIndex, 0, movedSong);

  savePlaylists(playlists);
};

export const renamePlaylist = (id: string, newName: string) => {
  const playlists = getPlaylists();
  const playlist = playlists.find((p) => p.id === id);
  if (playlist) {
    playlist.name = newName;
    savePlaylists(playlists);
  }
};
