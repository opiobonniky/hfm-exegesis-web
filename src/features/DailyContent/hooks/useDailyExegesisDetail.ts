import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fmtDate } from "../helpers/contentDetailHelpers";
import { parseDailyExegesisParam } from "../services/daily-exegesis-detail-service";

export function useDailyExegesisDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const exegesis = useMemo(
    () => parseDailyExegesisParam(params.get("exegesis")),
    [params],
  );

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const openEdit = useCallback(() => {
    if (!exegesis) return;
    navigate("/add-daily-exegesis", { state: { exegesis } });
  }, [exegesis, navigate]);

  return {
    data: {
      exegesis,
      displayDate: exegesis?.displayDate ? fmtDate(exegesis.displayDate) : "",
    },
    actions: {
      goBack,
      openEdit,
    },
  };
}
