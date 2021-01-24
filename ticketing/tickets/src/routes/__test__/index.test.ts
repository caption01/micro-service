import request from "supertest";
import { app } from "../../app";

jest.mock("../../nat-wrapper");

const creatTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "assad",
    price: 20,
  });
};

it("can fetch a list of ticket", async () => {
  await creatTicket();
  await creatTicket();
  await creatTicket();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
