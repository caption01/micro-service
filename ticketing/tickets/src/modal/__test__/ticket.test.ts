import { Ticket } from "../ticket";

it("implement optimistic concurrency control", async (done) => {
  // Create an instance of ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });

  // Save the ticket to DB.
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two seperate change to ticket
  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  // save the first fetch ticket.
  await firstInstance!.save();

  // save the second fetch ticket and expect error

  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }

  throw new Error("should not reach this point");
});

it("increments the version number on multiple save", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
