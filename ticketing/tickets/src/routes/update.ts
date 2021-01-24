import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from "@nhtickets/common";

import { Ticket } from "../modal/ticket";
import { natsWrapper } from "../nat-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publish";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is requires"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must prsitive"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.findById(req.params.id);

    if (!tickets) {
      throw new NotFoundError();
    }

    if (tickets.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    tickets.set({
      title: req.body.title,
      price: req.body.price,
    });

    await tickets.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: tickets.id,
      title: tickets.title,
      price: tickets.price,
      userId: tickets.userId,
      version: tickets.version,
    });

    res.send(tickets);
  }
);

export { router as updatedTicketRouter };
