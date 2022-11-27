import { FormHTMLAttributes, forwardRef, useCallback } from "react";
import { csrfToken } from "./react";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {}

export const Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  const { children, ...rest } = props;

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      props.onSubmit && props.onSubmit(event);

      console.log(event);
      // event.preventDefault();
    },
    [props.onSubmit]
  );

  return (
    <form {...rest} onSubmit={onSubmit} ref={ref}>
      <input type="hidden" name="_csrf_token" value={csrfToken || ""} />
      {children}
    </form>
  );
});
