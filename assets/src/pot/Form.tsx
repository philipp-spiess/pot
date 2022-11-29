import { FormHTMLAttributes, forwardRef, useCallback, useContext } from "react";
import { navigate } from "./navigation";
import { csrfToken } from "./react";
import { RouterContext } from "./Router";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {}

export const Form = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  const { children, ...rest } = props;

  const routerContext = useContext(RouterContext);
  if (!routerContext) {
    throw new Error("<Form /> must be used within a <Router />");
  }

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      const nativeEvent: SubmitEvent = event.nativeEvent as any;

      props.onSubmit && props.onSubmit(event);
      event.preventDefault();

      const form: HTMLFormElement = event.currentTarget as any;
      const submitter = nativeEvent.submitter;

      const action = props.action || routerContext.history.location.pathname;
      const formData = new FormData(form);

      // Include the submitter's name and value if it's a <button /> or
      // <input type="submit" />.
      if (
        submitter instanceof HTMLButtonElement ||
        submitter instanceof HTMLInputElement
      ) {
        formData.append(submitter.name, submitter.value);
      }

      await navigate(action, routerContext, {
        method: props.method || "GET",
        formData,
      });

      form.reset();
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
