/* vim: set noexpandtab ts=4 sw=4 ai si: */

// Check if given parameters to generate n-back cues are valid. There are number
// of cases to consider here:
//
// Given:
//	cues = 10
//	N	 = 1
//	assets = 1
//	positions = 1
//
// Then:
//	The variance, which is assets * positions = 1 therefore we cannot create a
//	set of cues that will be false (except for the first one).
//
// Note:
//	In above case: N = variances
//
// Given:
//	cues = 10
//	N	 = 2
//	assets = 1
//	positions = 2
//
// Then:
//	variance = 2
//
// Note:
//	N = variance
//
// TODO: THIS VALIDATION IS NOT COMPLETE
//
function valid (cues, N, matches, assets, positions) {

	var variance = positions * assets,
		playback = cues - N;

	// Number of matches must be greater the number of playback cues
	if (playback < N) return false;

	return true;

}


function random (variance, except) {

	if (except != null && (variance === 1 || except < 1 || variance < except)) {
		throw new Error('Cannot generate a random number for given (variance, except): (' + variance + ', ' + except + ')');
	}

	var variances = [],
		index = 0,
		random;

	for (index = 1; index <= variance; index += 1) {
		if (except != null && index === except) continue;

		variances.push(index);
	}

	// Generate a random index to choose from variances array
	random = (Math.random() * 100000 | 0) % variances.length;
	return variances[random];

}


function next (set, N, match, assets, positions) {

	var variance = assets * positions,
		current = set.length;

	if (current < N) {
		return random (variance);
	}

	if (match) {
		return set[current - N];
	}

	return random (variance, set[current - N]);

}


function generate (cues, N, matches, assets, positions) {

	if (!valid(cues, N, matches, assets, positions)) {
		//throw new Error('Cannot generate ' + N + '-Back cues based on parameters given.', arguments);
	}

	var set = [],
		need = matches,
		match = false;

	while (set.length < cues) {
		// TODO: need to tell it to match something
		// Presumably, we need to replace this greedy logic with a distribution
		// function of some sort. A random distribution function would work well
		// whilst uniform distribution wouldn't. If uniform distribution is used
		// the pattern of matching cues will be too linear and predictable.
		if (set.length >= N && need > 0) {
			match = true;
			need--;
		}

		set.push(next(set, N, match, assets, positions));
		match = false;
	}

	return set;

};



function test_generate (cues, N, matches, assets, positions) {

	try {
		var set = generate(cues, N, matches, assets, positions),
			index, length, current, sibling, matching = 0;

		// Go through the generated set and calculate the number of matching
		// cues.

		for (index = 0, length = set.length; index < length; index += 1) {
			if (index >= N) {
				current = set[index];
				sibling = set[index - N];

				if (current === sibling) {
					matching += 1;
				}
			}
		}

		// N, [cues...], verified, matches, found
		console.log(N, set, matches === matching, matches, matching);
	} catch (error) {
		console.error(error);
	}

}

console.log('N | SET | VERIFIED | MATCHES | FOUND');
test_generate(10, 1, 0, 2, 1);
test_generate(10, 5, 0, 3, 1);
test_generate(10, 7, 0, 4, 9);

test_generate(10, 1, 2, 2, 1);
test_generate(10, 5, 4, 3, 1);
test_generate(10, 7, 5, 4, 9);

test_generate(20, 1, 2, 2, 1);
test_generate(20, 5, 4, 3, 1);
test_generate(20, 7, 5, 4, 9);
