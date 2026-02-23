import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import Dashboard from "./dashboard";

const Pages = () => {
    return (
        <Router hook={useHashLocation}>
            <Switch>
                <Route path="/" component={Dashboard}></Route>
            </Switch>
        </Router>
    );
}

export default Pages;
