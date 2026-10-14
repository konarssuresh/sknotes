import { TextField } from "./text-field";

export function PasswordField(props) {
  return (
    <TextField type="password" autoComplete="current-password" {...props} />
  );
}
