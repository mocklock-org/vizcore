import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "VizCore Demo" },
    { name: "description", content: "Welcome to VizCore Demo!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
