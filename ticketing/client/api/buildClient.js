import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    //we on server

    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    //we on browser

    return axios.create({
      baseURL: "/",
    });
  }
};
