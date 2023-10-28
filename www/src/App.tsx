import { createBrowserHistory } from "history";
import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import "./App.css";
import { API_URL } from "./constants";
import Info from "./routes/Info";
import PdfContainer from "./routes/PdfContainer";
import Search from "./routes/Search";

export const history = createBrowserHistory();

const App = () => {
  if (!API_URL) {
    return <>REACT_APP_API_URL not specified. Add it to .env</>;
  }

  return (
    <Router basename="/onebook">
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
