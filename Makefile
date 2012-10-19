JS_COMPILER = \
	./lib/uglifyjs/bin/uglifyjs

JSDOCTEMPLATEDIR = \
		/local/tools/jsdoc-toolkit/templates/jsdoc

JSDOC_COMPILER = \
		/local/tools/jsdoc-toolkit/jsrun.sh -t=$(JSDOCTEMPLATEDIR)

all: \
	full \
	min

full: \
	vq.js \
	vq.circvis.js \
	vq.linear_browser.js \
	vq.brush_link.js \
	vq.chromavis.js \
	vq.cubbyhole.js \
	vq.violinplot.js \
	vq.stemplot.js \
	vq.scatterplot.js \
	vq.flexscroll.js \
	vq.par_coord.js

min: \
	vq.min.js \
	vq.circvis.min.js \
	vq.linear_browser.min.js \
	vq.brush_link.min.js \
	vq.chromavis.min.js \
	vq.cubbyhole.min.js \
	vq.violinplot.min.js \
	vq.stemplot.min.js \
	vq.scatterplot.min.js \
	vq.flexscroll.min.js \
	vq.par_coord.min.js

vq.js: \
	src/core/base.js \
	src/core/vis.js \
	src/core/models.js \
	src/core/utils.js \
	src/core/events.js \
	src/core/hovercard.js 	

vq.circvis.js: \
	src/circvis/circvis.js \
	src/circvis/wedge.js \
	src/circvis/ticks.js \
	src/circvis/network.js \
	src/circvis/circvis_api.js \
	src/circvis/predicate.js \
	src/circvis/circvisdata.js \
	src/circvis/wedgedata.js 

vq.linear_browser.js: \
	src/linear_browser/linear_browser.js 

vq.brush_link.js: \
	src/brush_link/brush_link.js

vq.chromavis.js: \
	src/chromavis/chromavis.js

vq.cubbyhole.js: \
	src/cubbyhole/cubbyhole.js

vq.violinplot.js: \
	src/violinplot/violinplot.js

vq.stemplot.js: \
	src/stemplot/stemplot.js

vq.scatterplot.js: \
	src/scatterplot/scatterplot.js

vq.flexscroll.js: \
	src/flexscroll/flexscroll.js

vq.par_coord.js: \
	src/par_coord/parallel_coordinates.js

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

vq.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a+w $@

vq%.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a+w $@

docs:
	mkdir docs
	$(JSDOC_COMPILER) . -d=docs

clean_docs:
	rm -rf docs

clean:
	rm -f vq*.js

make_zip:
	zip visquick_full.zip *.js
	zip visquick_min.zip *.min.js
