const searchUrl = "https://www.igigbook.com/lookup.aspx?fun=l2&songtile=";
//https://www.igigbook.com/lookup.aspx?fun=l2&songtitle=When%20Your%20Lover%20Has%20Gone

export const findSong = (song: string) => {
  const songUrlEnc = encodeURI(song);
  const fetchUrl = searchUrl + songUrlEnc;
  fetch(fetchUrl, { mode: "no-cors" }).then((response) =>
    console.log(response)
  );
};
