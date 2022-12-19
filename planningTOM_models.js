/* One-shot decisions to create an action by intervening on both belief and desire with uncertainty on change
*/
var annePossibleActions = ['Cafe','Swimmingpool'];

var anneInitialCheesecakeBelief = {
  cheesecakeAtCafe : 0.7,
  noCheesecakeAtCafe : 0.3
};

var anneInitialTowelBelief = {
  towelAtSwimmingpool : 0.01,
  noTowelAtSwimmingpool : 0.99
};

var anneInitialReward = {
    cheesecakeAtCafe :5,
    noCheesecakeAtCafe : 0,
    towelAtSwimmingpool : 0.1,
    noTowelAtSwimmingpool: 0
};

var anneExpectedRewardGivenAction = function(anneCheesecakeBelief, anneTowelBelief, anneReward) {
  var table = {
    Cafe : anneCheesecakeBelief['cheesecakeAtCafe'] * 1 * anneReward['cheesecakeAtCafe'],
    Swimmingpool : anneTowelBelief['towelAtSwimmingpool'] * 1 * anneReward['towelAtSwimmingpool']
  };
  return table;
};

var anneTransition = function(action, prob) {
  if (action === "do nothing") {
    return categorical({vs: annePossibleActions, 
                        ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneInitialTowelBelief, anneInitialReward))});
  } else if (action === 'tip over a cup of water') {
    if (flip(prob)) {
      var anneUpdatedReward = {
        cheesecakeAtCafe :5,
        noCheesecakeAtCafe : 0,
        towelAtSwimmingpool : 5,
        noTowelAtSwimmingpool: 0
      }; 
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneInitialTowelBelief, anneUpdatedReward))});
    } else {
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneInitialTowelBelief, anneInitialReward))});
    }
  } else if (action == 'flip over a sign') {
    if(flip(prob)) {
      var anneUpdatedTowelBelief = {
        towelAtSwimmingpool : 0.99,
        noTowelAtSwimmingpool : 0.01
      }
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneUpdatedTowelBelief, anneInitialReward))});
    } else{
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneInitialTowelBelief, anneInitialReward))});
    };
  } else {
    var anneUpdatedReward = {
      cheesecakeAtCafe : 5,
      noCheesecakeAtCafe : 0,
      towelAtSwimmingpool : 5,
      noTowelAtSwimmingpool: 0
    };
    var anneUpdatedTowelBelief = {
        towelAtSwimmingpool : 0.99,
        noTowelAtSwimmingpool : 0.01
    };
    if (flip(prob)){ //updade belief
      if(flip(prob)) { //update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneUpdatedTowelBelief, anneUpdatedReward))});
      } else{ //not update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneUpdatedTowelBelief, anneInitialReward))});
      };
    } else { //not update belief
      if (flip(prob)) { //update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneInitialTowelBelief, anneUpdatedReward))});
      } else { // not update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneInitialCheesecakeBelief, anneInitialTowelBelief, anneInitialReward))});
      }; 
    }; 
  };
};



var sallyUtility = function(goal_state, action, reward) {
  if (action === 'do nothing') {
    var actionCost = 0;
    return (goal_state === 'Swimmingpool') ? (reward - actionCost) : (0 - actionCost);
  } else if (action === 'tip over a cup of water') {
    var actionCost = 1;
    return (goal_state === 'Swimmingpool') ? (reward - actionCost) : (0 - actionCost);
  } else if (action === 'flip over a sign') {
    var actionCost = 1;
    return (goal_state === 'Swimmingpool') ? (reward - actionCost) : (0 - actionCost);
  } else {
    var actionCost = 2;
    return (goal_state === 'Swimmingpool') ? (reward - actionCost) : (0 - actionCost);
  }
};

var sallyActionOptionPrior = ['do nothing','tip over a cup of water',
                              'flip over a sign',
                              'both tip over a cup of water & flip over a sign']
var alpha = 1;

var softMaxAgent = function() {
  return Infer({ 
    model() {
      var action = uniformDraw(sallyActionOptionPrior);
      var prob = 0.9
      var utility = sallyUtility(anneTransition(action, prob), action, 10);
      factor(alpha * utility);
      return action;
    }
  });
};

viz(softMaxAgent());

// var sallyActionOptionPrior = Categorical({vs: ['do nothing',
//                                           'tip over a cup of water',
//                                           'flip over a sign',
//                                           'both tip over a cup of water & flip over a sign'],
//                                      ps: [0.3, 0.25, 0.25, 0.2]})

// var sallyChooseAction = function(goalState, transition) {
//   return Infer(function() {
//     var action = sample(sallyActionOptionPrior);
//     var prob = 0.9;
//     condition(goalState == transition(action, prob));
//     return action;
//   })
// }

// viz(sallyChooseAction('Swimmingpool', anneTransition));



/* One-shot decisions to stop an action by changing belief or/and desire with uncertainty on change
*/

var annePossibleActions = ['Home','Swimmingpool'];

var anneInitialSunbatheBelief = {
  sunbatheAtSwimmingpool : 0.9,
  cantSunbatheAtSwimmingpool : 0.1
};

var anneInitialGetCleanedBelief = {
  getCleanedAtHome : 0.9,
  cantGetCleanedAtHome : 0.1
};
                                      
var anneInitialReward = {
  sunbatheAtSwimmingpool : 5,
  cantSunbatheAtSwimmingpool : 0,
  getCleanedAtHome : 0.1,
  cantGetCleanedAtHome : 0
};

var anneExpectedRewardGivenAction = function(anneSunbatheBelief, anneGetCleanedBelief, anneReward) {
  var table = {
    Home : anneGetCleanedBelief['getCleanedAtHome'] * 1 * anneReward['getCleanedAtHome'],
    Swimmingpool : anneSunbatheBelief['sunbatheAtSwimmingpool'] * 1 * anneReward['sunbatheAtSwimmingpool']
  };
  return table;
};

var anneTransition = function(action, prob) {
  if (action === "do nothing") {
    return categorical({vs: annePossibleActions, 
                        ps: Object.values(anneExpectedRewardGivenAction(anneInitialSunbatheBelief, anneInitialGetCleanedBelief, anneInitialReward))});
  } else if (action === 'tip over a cup of water') {
    if (flip(prob)) {
      var anneUpdatedReward = {
        sunbatheAtSwimmingpool : 0.1,
        cantSunbatheAtSwimmingpool : 0,
        getCleanedAtHome : 5,
        cantGetCleanedAtHome : 0
      }; 
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialSunbatheBelief, anneInitialGetCleanedBelief, anneUpdatedReward))});
    } else {
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialSunbatheBelief, anneInitialGetCleanedBelief, anneInitialReward))});
    }
  } else if (action == 'flip over a sign') {
    if(flip(prob)) {
      var anneUpdatedSunbatheBelief = {
        sunbatheAtSwimmingpool : 0.01,
        cantSunbatheAtSwimmingpool : 0.99
      }
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneUpdatedSunbatheBelief, anneInitialGetCleanedBelief, anneInitialReward))});
    } else{
      return categorical({vs: annePossibleActions, 
                          ps: Object.values(anneExpectedRewardGivenAction(anneInitialSunbatheBelief, anneInitialGetCleanedBelief, anneInitialReward))});
    };
  } else {
    var anneUpdatedReward = {
      sunbatheAtSwimmingpool : 0.1,
      cantSunbatheAtSwimmingpool : 0,
      getCleanedAtHome : 5,
      cantGetCleanedAtHome : 0
    };
    var anneUpdatedSunbatheBelief = {
        sunbatheAtSwimmingpool : 0.01,
        cantSunbatheAtSwimmingpool : 0.99
    };
    if (flip(prob)){ //updade belief
      if(flip(prob)) { //update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneUpdatedSunbatheBelief, anneInitialGetCleanedBelief, anneUpdatedReward))});
      } else{ //not update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneUpdatedSunbatheBelief, anneInitialGetCleanedBelief, anneInitialReward))});
      };
    } else { //not update belief
      if (flip(prob)) { //update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneInitialSunbatheBelief, anneInitialGetCleanedBelief, anneUpdatedReward))});
      } else { // not update desire
        return categorical({vs: annePossibleActions, 
                            ps: Object.values(anneExpectedRewardGivenAction(anneInitialSunbatheBelief, anneInitialGetCleanedBelief, anneInitialReward))});
      }; 
    }; 
  };
};


var sallyUtility = function(goal_state, action, reward) {
  if (action === 'do nothing') {
    var actionCost = 0;
    return (goal_state === 'Home') ? (reward - actionCost) : (0 - actionCost);
  } else if (action === 'tip over a cup of water') {
    var actionCost = 1;
    return (goal_state === 'Home') ? (reward - actionCost) : (0 - actionCost);
  } else if (action === 'flip over a sign') {
    var actionCost = 1;
    return (goal_state === 'Home') ? (reward - actionCost) : (0 - actionCost);
  } else {
    var actionCost = 2;
    return (goal_state === 'Home') ? (reward - actionCost) : (0 - actionCost);
  }
};

var sallyActionOptionPrior = ['do nothing','tip over a cup of water',
                              'flip over a sign',
                              'both tip over a cup of water & flip over a sign']
var alpha = 1;

var softMaxAgent = function() {
  return Infer({ 
    model() {
      var action = uniformDraw(sallyActionOptionPrior);
      var prob = 0.9
      var utility = sallyUtility(anneTransition(action, prob), action, 10);
      factor(alpha * utility);
      return action;
    }
  });
};

viz(softMaxAgent());


// var sallyActionOptionPrior = Categorical({vs: ['do nothing',
//                                           'tip over a cup of water',
//                                           'flip over a sign',
//                                           'both tip over a cup of water & flip over a sign'],
//                                      ps: [0.4, 0.25, 0.25, 0.1]})

// var sallyChooseAction = function(goalNegativeState, transition) {
//   return Infer(function() {
//     var action = sample(sallyActionOptionPrior)
//     var prob = 0.9;
//     var goalStateList = remove(goalNegativeState,['Home','Swimmingpool']);
//     condition(goalStateList.includes(transition(action, prob)));
//     return action;
//   })
// }

// viz(sallyChooseAction('Swimmingpool', anneTransition));