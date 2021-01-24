import nats from "node-nats-streaming";

import { TicketPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to nats");
  const publisher = new TicketPublisher(stan);

  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 110,
    });
  } catch (err) {
    console.error(err);
  }
});
