import mongoose, { mongo } from "mongoose";
import { OrderStatus } from "@nhtickets/common";

import { TicketDoc } from "./ticket";

export { OrderStatus };

interface OrderAtts {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderModal extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAtts): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.statics.build = (attr: OrderAtts) => {
  return new Order(attr);
};

const Order = mongoose.model<OrderDoc, OrderModal>("Order", orderSchema);

export { Order };
