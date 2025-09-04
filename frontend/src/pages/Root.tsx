import { useConfig } from "@/context/ConfigContext";
import { Outlet } from "react-router-dom";
import Loading from "./Loading";

export default function Root() {
  const { loading } = useConfig();
  if (loading) return <Loading />;
  return <Outlet />;
}
