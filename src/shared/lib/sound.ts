let audioContext: AudioContext | null = null;

const getAudioContext = () => {
	if (!audioContext) {
		audioContext = new AudioContext();
	}

	return audioContext;
};

const playTone = async (frequency: number, startTime: number, duration: number) => {
	const context = getAudioContext();

	if (context.state === 'suspended') {
		await context.resume();
	}

	const oscillator = context.createOscillator();
	const gain = context.createGain();

	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime(frequency, startTime);

	gain.gain.setValueAtTime(0.0001, startTime);
	gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.015);
	gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

	oscillator.connect(gain);
	gain.connect(context.destination);

	oscillator.start(startTime);
	oscillator.stop(startTime + duration);
};

const playSequence = async (tones: Array<{ frequency: number; delay: number; duration: number }>) => {
	try {
		const context = getAudioContext();
		const now = context.currentTime;

		await Promise.all(
			tones.map((tone) =>
				playTone(tone.frequency, now + tone.delay, tone.duration)
			)
		);
	} catch (err) {
		console.warn('알림음을 재생하지 못했습니다.', err);
	}
};

export const playLookupSuccessSound = () => {
	void playSequence([
		{ frequency: 880, delay: 0, duration: 0.08 },
		{ frequency: 1175, delay: 0.09, duration: 0.1 },
	]);
};

export const playLookupErrorSound = () => {
	void playSequence([
		{ frequency: 220, delay: 0, duration: 0.12 },
		{ frequency: 165, delay: 0.13, duration: 0.14 },
	]);
};
