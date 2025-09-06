import { faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./TitleBar.css";

const TitleBar = ({ rightContent }: { rightContent?: ReactNode }) => {
  return (
    <>
      <div className="title-bar">
        <Link to="/">
          <h2>OneBook</h2>
        </Link>
        <div className="right-content">
          {!!rightContent && rightContent}
          <Link to={`/`}>
            <FontAwesomeIcon icon={faSearch} title="Search" />
          </Link>
          <Link to="/info">
            <FontAwesomeIcon icon={faInfoCircle} />{" "}
          </Link>
        </div>
      </div>
    </>
  );
};

export default TitleBar;
