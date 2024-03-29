import data from "../data.json";

const channels = data.channels;

export default function selectRandomChannel() {
  return channels[Math.floor(Math.random() * channels.length)];
}
