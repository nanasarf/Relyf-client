import { Alert, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";

import { apiUrl, API_BASE } from "../lib/apiBase";

export default function OfflineBanner() {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(apiUrl("/api/Health"), {
          cache: "no-store",
          // ensure cookies are sent if backend uses cookie auth; kept consistent with RTK baseQuery
          credentials: "include",
        });
        setOpen(!res.ok);
      } catch {
        setOpen(true);
      }
    };

    // initial check
    check();
    // repeat every 12s
    timer.current = window.setInterval(check, 12000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  return (
    <Collapse in={open} unmountOnExit>
      <Alert
        severity="error"
        action={
          <IconButton
            color="inherit"
            size="small"
            aria-label="close"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ borderRadius: 0 }}
      >
        Cannot reach the backend. Please make sure the API is running at{" "}
        {API_BASE}.
      </Alert>
    </Collapse>
  );
}
