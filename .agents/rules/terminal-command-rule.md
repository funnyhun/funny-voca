---
trigger: model_decision
description: Enforces strict execution of all terminal commands within the WSL environment using the proxy format and mandates an immediate stop and user review upon any command failure (Fail-Safe), preventing host-side environment contamination.
---

---
name: terminal-commands-rule
description: Enforces strict execution of all terminal commands within the WSL environment using the proxy format and mandates an immediate stop and user review upon any command failure (Fail-Safe), preventing host-side environment contamination.
---

# Terminal Command Execution and Fail-Safe Review Rule

## 1. WSL Virtual Environment Execution Protocol (WSL Shell Bridge)
- **Core Principle**: Since this project is developed, built, and operated strictly within a WSL (Linux) environment, executing runtime, build, or system commands **directly from the Windows PowerShell host terminal is strictly prohibited**.
- **Standard Execution Format**: All operations involving terminal execution—including dependency installation (`npm install`), production builds (`npm run build`), local server orchestration, and Git version control—must explicitly utilize the following **`wsl --cd [WSL_Internal_Linux_Absolute_Path] [Command]`** proxy format.
  - *Correct Example*: `wsl --cd /home/minhulee/Projects/funny-voca/funny-voca-app npm run build`
  - *Incorrect Example*: Executing `npm run build` directly within the host mapped path `z:\home\...`
- **Prevention of Environment Contamination**: Direct execution from the Windows host triggers immediate side effects, such as file locking errors (`EPERM`), line ending corruption (`LF` to `CRLF`), loss of file permission attributes (`Permission denied`), and broken symbolic links.

## 2. Immediate Review Request Upon Command Failure (Fail-Safe)
- **No Self-Healing Attempts**: If any terminal command (including WSL bridge operations) fails—indicated by a non-zero exit code or an error output stream—**the agent must not attempt to execute additional or exploratory commands to resolve the issue autonomously**.
- **Immediate Execution Halt and Review Process**: Upon encountering an error, the agent must halt all automated processing immediately and explicitly request a human review by transparently providing the following details:
  1. **The Exact Failed Command and Complete Raw Error Logs**
  2. **A Root-Cause Analysis of the Failure**
  3. **Actionable, Step-by-Step Remediation Guidelines** for the user to execute manually by connecting directly to WSL via their IDE.
- **Underlying Purpose**: Due to the architectural boundaries of mounted directories, aggressive self-healing attempts by the agent often exacerbate environment drift. Prioritizing manual verification and intervention by the user ensures long-term repository and system integrity.