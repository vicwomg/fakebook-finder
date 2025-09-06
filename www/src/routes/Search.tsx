import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import SearchResults, { SearchResult } from "./SearchResults";

const Search = () => {
  const [results, setResults] = React.useState<Array<SearchResult>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [initialSearchDone, setInitialSearchDone] =
    React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>(() => {
    // Initialize from localStorage with expiration check
    const getStoredSearchInput = () => {
      try {
        const stored = localStorage.getItem("searchInputData");
        if (!stored) return "";

        const { value, timestamp } = JSON.parse(stored);
        const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour in milliseconds

        if (timestamp < oneHourAgo) {
          // Data is older than 1 hour, clear it
          localStorage.removeItem("searchInputData");
          return "";
        }

        return value || "";
      } catch (error) {
        // Invalid JSON or other error, clear it
        localStorage.removeItem("searchInputData");
        return "";
      }
    };

    return getStoredSearchInput();
  });

  const { query } = useParams<{ query?: string }>();
  const history = useHistory();

  // Handle URL query parameter and persisted search
  React.useEffect(() => {
    if (!!query) {
      // URL has query parameter - use it
      setInput(query);
      localStorage.setItem(
        "searchInputData",
        JSON.stringify({
          value: query,
          timestamp: Date.now(),
        })
      );
      handleSearch(query);
      setInitialSearchDone(true);
    } else if (!initialSearchDone) {
      // No URL query and haven't done initial search yet
      // The input is already loaded from localStorage with expiration check
      if (input && input.length >= 2) {
        handleSearch(input);
      }
      setInitialSearchDone(true);
    }
  }, [query, initialSearchDone]); // Runs when query or initialSearchDone changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Save to localStorage with timestamp
    localStorage.setItem(
      "searchInputData",
      JSON.stringify({
        value: value,
        timestamp: Date.now(),
      })
    );

    value !== null && setSearchFailed(false);
    debounceSearch(value);
  };

  const handleSearch = (value: string) => {
    if (!!value && value.length >= 2) {
      setLoading(true);
      fetch(`${API_URL}/search/song?q=${encodeURI(value)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.result.length === 0) setSearchFailed(true);
          setResults(data.result);
        })
        .then(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  };

  const debounceSearch = React.useCallback(_.debounce(handleSearch, 500), []);

  const handleRandomSong = () => {
    setLoading(true);
    fetch(`${API_URL}/info/random`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          const { source, page, title } = data.result;
          history.push(`/source/${encodeURIComponent(source)}/${page}`, {
            title,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching random song:", error);
        setLoading(false);
      });
  };

  return (
    <>
      <TitleBar />
      <div className="container">
        <input
          placeholder="Enter a song title to search"
          onChange={handleInputChange}
          value={input}
          autoFocus
          id="search-input"
          style={{
            marginBottom: 10,
            width: "85%",
            fontSize: 18,
            padding: "7px 22px 5px 8px",
          }}
        ></input>
        <span
          onClick={() => {
            setInput("");
            setResults([]);
            // Clear from localStorage
            localStorage.removeItem("searchInputData");
          }}
          className="clear-button"
        >
          <FontAwesomeIcon icon={faTimes} />
        </span>

        {!results.length && (
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <button
              onClick={handleRandomSong}
              disabled={loading}
              className="blue-button"
            >
              {loading ? "Loading..." : "🎲 Random song!"}
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}
        {results && !loading && results.length > 0 && (
          <SearchResults searchResults={results} searchQuery={input} />
        )}
        {searchFailed && (
          <p>
            No matches for that search{" "}
            <span role="img" aria-label="sad">
              😭
            </span>
          </p>
        )}
        {results.length === 0 && (
          <p style={{ fontSize: 70, margin: 0 }}>
            <span role="img" aria-label="clef">
              🎼
            </span>
          </p>
        )}
      </div>
    </>
  );
};

export default Search;
