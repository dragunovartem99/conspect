import { useLayoutEffect, useRef } from "react";
import type { ComponentProps } from "react";

/** A textarea that is always as tall as its text, so nothing needs scrolling to read. */
export function AutoTextarea(props: ComponentProps<"textarea">) {
	const ref = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const fit = () => {
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
		};
		fit();
		window.addEventListener("resize", fit);
		return () => window.removeEventListener("resize", fit);
	}, [props.value]);

	return (
		<textarea
			ref={ref}
			{...props}
		/>
	);
}
