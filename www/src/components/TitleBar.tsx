import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./TitleBar.css";

const TitleBar = ({ rightContent }: { rightContent?: ReactNode }) => {
  return (
    <>
      <div className="title-bar">
        <Link to="/">
          <h2>OneFakebook</h2>
        </Link>
        {!!rightContent && rightContent}
      </div>
    </>
  );
};

export default TitleBar;
