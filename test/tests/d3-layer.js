suite("d3.layer", function() {
	"use strict";

	suite("constructor", function() {
		test("returns a reference to the selection", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.equal(inst, base);
		});
		test("extends the selection with a `draw` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.typeOf(inst.draw, "function");
		});
		test("extends the selection with an `on` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.typeOf(inst.on, "function");
		});
		test("extends the selection with an `off` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.typeOf(inst.off, "function");
		});
	});

	suite('#draw', function() {
		setup(function() {
			var dataBind = this.dataBind = sinon.spy(function(data) {
				var updating = this.data(data);
				sinon.spy(updating, "enter");
				sinon.spy(updating, "transition");
				var exitSelection = updating.exit.bind(updating);
				sinon.stub(updating, "exit", function() {
					var exiting = exitSelection();
					sinon.spy(exiting, "transition");
					return exiting;
				});
				return updating;
			});
			var insert = this.insert = sinon.spy(function() {
				var entering = this.insert("g");
				sinon.spy(entering, "transition");
				return entering;
			});
			var base = this.base = d3.select("#test");

			this.layer = base.layer({
				dataBind: dataBind,
				insert: insert
			});
		});
		test("invokes the provided `dataBind` method exactly once", function() {
			assert.equal(this.dataBind.callCount, 0);
			this.layer.draw([]);
			assert.equal(this.dataBind.callCount, 1);
		});
		test("invokes the provided `dataBind` method in the context of the layer's selection", function() {
			assert.equal(this.dataBind.callCount, 0);
			this.layer.draw([]);
			assert(this.dataBind.calledOn(this.base));
		});
		test("invokes the provided `dataBind` method with the specified data", function() {
			var data = [];
			assert.equal(this.dataBind.callCount, 0);
			this.layer.draw(data);
			assert.equal(this.dataBind.args[0][0], data);
		});
		test("invokes the provided `insert` method exactly once", function() {
			assert.equal(this.insert.callCount, 0);
			this.layer.draw([]);
			assert.equal(this.insert.callCount, 1);
		});
		test("invokes the provided `insert` method in the context of the layer's bound 'enter' selection", function() {
			this.layer.draw([]);
			assert(this.insert.calledOn(this.dataBind.returnValues[0].enter.returnValues[0]));
		});
		suite("event triggering", function() {
			setup(function() {
				var onEnter1 = this.onEnter1 = sinon.spy();
				var onUpdate1 = this.onUpdate1 = sinon.spy();
				var onUpdate2 = this.onUpdate2 = sinon.spy();
				var onExit1 = this.onExit1 = sinon.spy();
				var onExit2 = this.onExit2 = sinon.spy();
				var onExit3 = this.onExit3 = sinon.spy();
				var onEnterTrans1 = this.onEnterTrans1 = sinon.spy();
				var onEnterTrans2 = this.onEnterTrans2 = sinon.spy();
				var onEnterTrans3 = this.onEnterTrans3 = sinon.spy();
				var onUpdateTrans1 = this.onUpdateTrans1 = sinon.spy();
				var onUpdateTrans2 = this.onUpdateTrans2 = sinon.spy();
				var onExitTrans1 = this.onExitTrans1 = sinon.spy();

				this.layer.on("enter", onEnter1);
				this.layer.on("update", onUpdate1);
				this.layer.on("update", onUpdate2);
				this.layer.on("exit", this.onExit1);
				this.layer.on("exit", this.onExit2);
				this.layer.on("exit", this.onExit3);
				this.layer.on("enter:transition", onEnterTrans1);
				this.layer.on("enter:transition", onEnterTrans2);
				this.layer.on("enter:transition", onEnterTrans3);
				this.layer.on("update:transition", onUpdateTrans1);
				this.layer.on("update:transition", onUpdateTrans2);
				this.layer.on("exit:transition", onExitTrans1);
			});
			test("invokes all event handlers exactly once", function() {
				this.layer.draw([]);

				assert.equal(this.onEnter1.callCount, 1);
				assert.equal(this.onUpdate1.callCount, 1);
				assert.equal(this.onUpdate2.callCount, 1);
				assert.equal(this.onExit1.callCount, 1);
				assert.equal(this.onExit2.callCount, 1);
				assert.equal(this.onExit3.callCount, 1);
				assert.equal(this.onEnterTrans1.callCount, 1);
				assert.equal(this.onEnterTrans2.callCount, 1);
				assert.equal(this.onEnterTrans3.callCount, 1);
				assert.equal(this.onUpdateTrans1.callCount, 1);
				assert.equal(this.onUpdateTrans2.callCount, 1);
				assert.equal(this.onExitTrans1.callCount, 1);
			});
			test("invokes all event handlers in the context of the corresponding 'lifecycle selection'", function() {
				var entering, updating, exiting;
				this.layer.draw([]);

				// Alias lifecycle selections
				entering = this.insert.returnValues[0];
				updating = this.dataBind.returnValues[0];
				exiting = updating.exit.returnValues[0];

				assert(this.onEnter1.calledOn(entering));
				assert(this.onUpdate1.calledOn(updating));
				assert(this.onExit1.calledOn(exiting));
				assert(this.onEnterTrans1.calledOn(entering.transition.returnValues[0]));
				assert(this.onUpdateTrans1.calledOn(updating.transition.returnValues[0]));
				assert(this.onExitTrans1.calledOn(exiting.transition.returnValues[0]));
			});

		});
	});
});
