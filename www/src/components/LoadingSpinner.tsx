import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ message }: { message?: string }) => (
  <>
    <div className="loader"></div>
    <p>{message ? message : "Just a sec..."}</p>
  </>
);

export default LoadingSpinner;
