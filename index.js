const path = require("path");

module.exports = {
  agentPath: path.join(__dirname, "agents", "swarm-orchestrator.md"),
  commandPath: path.join(__dirname, "commands", "swarm.md"),
  handoffPath: path.join(__dirname, "rules", "handoff-protocol.md"),
};
