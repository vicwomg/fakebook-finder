import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { API_URL } from "./constants";
import PdfContainer from "./routes/PdfContainer";
import Search from "./routes/Search";
import Info from "./routes/Info";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

const App = () => {
  if (!API_URL) {
    return <>REACT_APP_API_URL not specified. Add it to .env</>;
  }

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/source/:source/:page" component={PdfContainer}></Route>
          <Route path="/search/:query">
            <Search />
          </Route>
          <Route path="/info">
            <Info />
          </Route>
          <Route path="/">
            <Search />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
