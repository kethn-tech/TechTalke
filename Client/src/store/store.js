import { create } from "zustand";
import { createAuthSlice } from "./slices/authSlice";
import {createChatSlice} from "./slices/chatSlice";

export const useStore = create()((...a) => ({
    ...createAuthSlice(...a),
    ...createChatSlice(...a)
}))