'use strict';

module.exports = {
  // Filtration modes
  FiltrationMode: {
    Off: 0, // Force the filtration OFF
    On: 1, // Force the filtration to ON
    Auto: 2, // Compute the filtration time according to the water's temperature
  },
  // Steps of a life cycle
  ModuleLifeCycle: {
    Pending: 0, // Waiting for activation
    Activated: 10, // Activated
    BackForRepairs: 20, // Back for repairs
    Repaired: 30, // Repaired and back to the circuit
    OutOfOrder: 40, // Out of order / buried
  },
  // Module types
  ModuleType: {
    AnalysR: 1, // Flipr AnalysR
    ControlR: 2, // Flipr ControlR (hub)
  },
  // Pool modes
  PoolModeCode: {
    InUse: 0, // ex: Summer for the swimmingPools
    ActivePause: 1, // ex: the pool is still filtrated, but not used anymore
    PassivePause: 2, // ex: the pool is not filtrated anymore, winter
  },
  // Pool types and their names
  PoolTypeCode: {
    SwimmingPool: 0,
    SPA: 1,
  },
  SectoryType: {
    TooLow: 0,
    MediumLow: 5,
    Medium: 10,
    MediumHigh: 15,
    TooHigh: 20,
  },
};
