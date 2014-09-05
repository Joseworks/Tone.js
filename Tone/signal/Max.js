define(["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/Selector", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  the output signal is the greater of the incoming signal and max
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} max the 
	 */
	Tone.Max = function(max){
		Tone.call(this);

		/**
		 *  the max signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._maxSignal = new Tone.Signal(max);

		/**
		 *  @type {Tone.Selector}
		 *  @private
		 */
		this._switch = new Tone.Selector(2);

		/**
		 *  @type {Tone.Selector}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(max);

		//connections
		this._maxSignal.connect(this._switch, 0, 0);
		this.input.connect(this._switch, 0, 1);
		this.input.connect(this._gt);
		this._gt.connect(this._switch.gate);
		this._switch.connect(this.output);
	};

	Tone.extend(Tone.Max);

	/**
	 *  set the max value
	 *  @param {number} max the maximum to compare to the incoming signal
	 */
	Tone.Max.prototype.setMax = function(max){
		this._maxSignal.setValue(max);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Max.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Max.prototype.dispose = function(){
		this.input.disconnect();
		this.output.disconnect();
		this._maxSignal.dispose();
		this._switch.dispose();
		this._gt.dispose();
		this.input = null;
		this.output = null;
		this._maxSignal = null;
		this._switch = null;
		this._gt = null;
	};

	return Tone.Max;
});