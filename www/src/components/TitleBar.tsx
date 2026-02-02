import {
  faArrowLeft,
  faBookOpen,
  faList,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../styles/Global.css";
import "./TitleBar.css";

const TitleBar = ({
  rightContent,
  onBack,
}: {
  rightContent?: ReactNode;
  onBack?: () => void;
}) => {
  return (
    <>
      <div className="title-bar">
        <div className="left-content">
          <Link to="/" style={{ marginRight: 5 }}>
            <h2>OneBook</h2>
          </Link>
          <button
            className="unstyled-button"
            onClick={() => {
              onBack ? onBack() : window.history.back();
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} title="Back" />
          </button>
          <Link to={`/`}>
            <FontAwesomeIcon icon={faSearch} title="Search" />
          </Link>
          <Link to="/playlists" style={{ color: "white" }}>
            <FontAwesomeIcon icon={faList} title="Playlists" />
          </Link>
          <Link to="/info">
            <FontAwesomeIcon icon={faBookOpen} title="Browse books" />{" "}
          </Link>
        </div>
        <div className="right-content">{!!rightContent && rightContent}</div>
      </div>
    </>
  );
};

export default TitleBar;
