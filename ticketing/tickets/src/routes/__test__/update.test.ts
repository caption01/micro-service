import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

import { natsWrapper } from "../../nat-wrapper";

it("return 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "asasdasdsadsad",
      price: 20,
    })
    .expect(404);
});

it("return 401 if the user is not authencicated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "assadsadsaasd",
      price: 20,
    })
    .expect(401);
});

it("return 401 if the user is not own ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdsaasdcxvbafsad",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "asdsasdsadasad",
      price: 300,
    })
    .expect(401);
});

it("return 400 if the user provide an invalid title or price", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdsaasdcxvbafsad",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdsada",
      price: -20,
    })
    .expect(400);
});

it("update the ticket provided correct input", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdsaasdcxvbafsad",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "newTitle",
      price: 100,
    })
    .expect(200);

  const ticketsResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketsResponse.body.title).toEqual("newTitle");
  expect(ticketsResponse.body.price).toEqual(100);
});

it("publishes an events", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdsaasdcxvbafsad",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "newTitle",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
