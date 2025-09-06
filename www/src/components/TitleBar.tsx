import {
  faArrowLeft,
  faBookOpen,
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
        <Link to="/">
          <h2>OneBook</h2>
        </Link>
        <div className="right-content">
          <button
            className="unstyled-button"
            onClick={() => {
              onBack ? onBack() : window.history.back();
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} title="Back" />
          </button>
          {!!rightContent && rightContent}
          <Link to={`/`}>
            <FontAwesomeIcon icon={faSearch} title="Search" />
          </Link>
          <Link to="/info">
            <FontAwesomeIcon icon={faBookOpen} title="Browse books" />{" "}
          </Link>
        </div>
      </div>
    </>
  );
};

export default TitleBar;
