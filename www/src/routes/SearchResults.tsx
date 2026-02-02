import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useHistory } from "react-router-dom";
import AddToPlaylistButton from "../components/AddToPlaylistButton";
import styles from "./SearchResults.module.css";

export type SearchResult = {
  title: string;
  page: string;
  source: string;
};

export type CurrentSelection = {
  source: string;
  page: number | string;
};

const SearchResults = ({
  searchResults,
  searchQuery,
  currentSelection,
  showAddButton = true,
}: {
  searchResults: SearchResult[];
  searchQuery: string | null;
  currentSelection?: CurrentSelection;
  showAddButton?: boolean;
}) => {
  const history = useHistory();

  const handleClick = (source: string, page: string, title: string) => {
    history.push(`/source/${source}/${page}`, {
      searchResults: searchResults,
      searchQuery: searchQuery,
      title: title,
    });
  };

  return (
    <div className={styles.results}>
      {searchResults.map((r, index) => {
        return (
          <div
            onClick={() => handleClick(r.source, r.page, r.title)}
            key={index}
            className="clickable-row"
            style={{ position: "relative" }}
          >
            <div>
              {currentSelection &&
                currentSelection.source === r.source &&
                Number(currentSelection.page) === Number(r.page) && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ marginRight: 10, color: "green" }}
                  />
                )}
              {r.title}
              <p
                style={{
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "black",
                  margin: "4px 0px 0px",
                }}
              >
                {r.source} - p.{r.page}
              </p>
            </div>
            {showAddButton && (
              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <AddToPlaylistButton song={r} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
