import { configureStore } from "@reduxjs/toolkit";
import cleanupSlice from "./cleanupSlice";
import trashSlice from "./trashSlice";

export const store = configureStore({
  reducer: {
    trash: trashSlice,
    cleanup: cleanupSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["trash/submitTrashReport/fulfilled"],
      },
    }),
});
