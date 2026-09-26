import { useEffect, useState } from "react";

/** Shown while the neural network is writing; mount it only for that time. */
export function Progress({ showElapsed = false }: { showElapsed?: boolean }) {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		if (!showElapsed) return;
		const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
		return () => clearInterval(timer);
	}, [showElapsed]);

	return (
		<div
			role="status"
			className="progress"
		>
			<div className="bar" />
			<p className="muted">
				Это занимает от 30 до 90 секунд.{showElapsed && ` Прошло: ${seconds} с.`}
			</p>
		</div>
	);
}
