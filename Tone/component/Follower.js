define(["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Negate", "Tone/signal/Threshold"], function(Tone){

	/**
	 *  Follow the envelope of the incoming signal
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Tone.Time=} [attackTime = 0.01] 
	 *  @param {Tone.Time=} [releaseTime = 0.1] 
	 */
	Tone.Follower = function(attackTime, releaseTime){

		Tone.call(this);

		//default values
		attackTime = this.defaultArg(attackTime, 0.01);
		releaseTime = this.defaultArg(releaseTime, 0.1);

		/**
		 *  @type {Tone.Abs}
		 *  @private
		 */
		this._abs = new Tone.Abs();

		/**
		 *  the lowpass filter
		 *  @type {BiquadFilterNode}
		 *  @private
		 */
		this._filter = this.context.createBiquadFilter();
		this._filter.type = "lowpass";
		this._filter.frequency.value = 0;

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._frequencyValues = this.context.createWaveShaper();
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		/**
		 *  @type {GainNode}
		 *  @private
		 */
		this._difference = this.context.createGain();

		/**
		 *  @type {GainNode}
		 *  @private
		 */
		this._thresh = new Tone.Threshold(0);

		//the smoothed signal
		this.chain(this.input, this._abs, this._filter, this.output);
		//subtract the smoothed signal from the input signal
		this.input.connect(this._negate);
		this.output.connect(this._difference);
		this._negate.connect(this._difference);
		//threshold the difference and use the thresh to set the frequency
		this.chain(this._difference, this._thresh, this._frequencyValues, this._filter.frequency);
		//set the attack and release values in the table
		this._setAttackRelease(this.secondsToFrequency(attackTime), this.secondsToFrequency(releaseTime));
	};

	Tone.extend(Tone.Follower);

	/**
	 *  sets the attack and release times in the wave shaper
	 *  @param   {number} attack  
	 *  @param   {number} release 
	 *  @private
	 */
	Tone.Follower.prototype._setAttackRelease = function(attack, release){
		var curveLength = 1024;
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = (i / (curveLength - 1)) * 2 - 1;
			var val;
			if (normalized < 0.5){
				val = attack;
			} else {
				val = release;
			}
			curve[i] = val;
		}
		this._frequencyValues.curve = curve;
	};

	/**
	 *  dispose
	 */
	Tone.Follower.prototype.dispose = function(){
		this._filter.disconnect();
		this.input.disconnect();
		this._frequencyValues.disconnect();
		this.output.disconnect();
		this._abs.dispose();
		this._negate.dispose();
		this._difference.dispose();
		this._thresh.dispose();
		this._filter = null;
		this.input = null;
		this._frequencyValues = null;
		this.output = null;
		this._abs = null;
		this._negate = null;
		this._difference = null;
		this._thresh = null;
	};

	return Tone.Follower;
});