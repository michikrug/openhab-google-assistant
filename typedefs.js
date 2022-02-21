/**
 * Intent
 * @typedef {"action.devices.SYNC"|"action.devices.QUERY"|"action.devices.EXECUTE"|"action.devices.DISCONNECT"} Intent
 */

/**
 * Execute Intent
 * @typedef {Object} ExecuteIntent
 * @property {string} requestId
 * @property {ExecuteIntentInput[]} inputs
 */

/**
 * Execute Intent Input
 * @typedef {Object} ExecuteIntentInput
 * @property {Intent} intent
 * @property {Object} payload
 * @property {ExecuteIntentCommand[]} payload.commands
 */

/**
 * Execute Intent Command
 * @typedef {Object} ExecuteIntentCommand
 * @property {ExecuteIntentCommandDevice[]} devices
 * @property {ExecuteIntentCommandExecution[]} execution
 */

/**
 * Execute Intent Command Device
 * @typedef {Object} ExecuteIntentCommandDevice
 * @property {string} id
 * @property {Object} [customData]
 */

/**
 * Execute Intent Command Execution
 * @typedef {Object} ExecuteIntentCommandExecution
 * @property {string} command
 * @property {ExecuteIntentCommandExecutionParams} [params]
 * @property {ExecuteIntentCommandExecutionChallenge} [challenge]
 */

/**
 * Execute Intent Command Execution Params
 * @typedef {Object} ExecuteIntentCommandExecutionParams
 */

/**
 * Execute Intent Command Challenge
 * @typedef {Object} ExecuteIntentCommandExecutionChallenge
 * @property {boolean} [ack]
 * @property {string} [pin]
 */

/**
 * Execute Response
 * @typedef {Object} ExecuteResponse
 * @property {string} requestId
 * @property {ExecuteResponsePayload} payload
 */

/**
 * Execute Response Payload
 * @typedef {Object} ExecuteResponsePayload
 * @property {string} [errorCode]
 * @property {ExecuteResponsePayloadCommand[]} commands
 */

/**
 * Execute Response Payload Command
 * @typedef {Object} ExecuteResponsePayloadCommand
 * @property {string[]} ids
 * @property {"SUCCESS"|"PENDING"|"OFFLINE"|"ERROR"} status
 * @property {Object} [states]
 * @property {boolean} states.online
 * @property {string} [errorCode]
 * @property {Object} [challengeNeeded]
 * @property {"ackNeeded"|"pinNeeded"|"challengeFailedPinNeeded"} challengeNeeded.type
 */

/**
 * Sync Intent
 * @typedef {Object} SyncIntent
 * @property {string} requestId
 * @property {SyncIntentInput[]} inputs
 */

/**
 * Sync Intent Input
 * @typedef {Object} SyncIntentInput
 * @property {Intent} intent
 */

/**
 * Sync Response
 * @typedef {Object} SyncResponse
 * @property {string} requestId
 * @property {SyncResponsePayload} payload
 */

/**
 * Sync Response Payload
 * @typedef {Object} SyncResponsePayload
 * @property {string} [agentUserId]
 * @property {string} [errorCode]
 * @property {Metadata[]} devices
 */

/**
 * Query Intent
 * @typedef {Object} QueryIntent
 * @property {string} requestId
 * @property {QueryIntentInput[]} inputs
 */

/**
 * Query Intent Input
 * @typedef {Object} QueryIntentInput
 * @property {Intent} intent
 * @property {Object} payload
 * @property {QueryIntentDevice[]} payload.devices
 */

/**
 * Query Intent Device
 * @typedef {Object} QueryIntentDevice
 * @property {string} id
 * @property {Object} [customData]
 */

/**
 * Query Response
 * @typedef {Object} QueryResponse
 * @property {string} requestId
 * @property {QueryResponsePayload} payload
 */

/**
 * Query Response Payload
 * @typedef {Object} QueryResponsePayload
 * @property {string} [errorCode]
 * @property {Object.<string, QueryResponsePayloadDevice>} devices
 */

/**
 * Query Response Payload Device
 * @typedef {Object} QueryResponsePayloadDevice
 * @property {boolean} online
 * @property {"SUCCESS"|"PENDING"|"OFFLINE"|"EXCEPTIONS"|"ERROR"} status
 * @property {string} [errorCode]
 */

/**
 * Item
 * @typedef {Object} Item
 * @property {string} [name]
 * @property {string} [type]
 * @property {string} [label]
 * @property {string} [state]
 * @property {Object} [metadata]
 * @property {Object} metadata.ga
 * @property {string} metadata.ga.value
 * @property {Object} [metadata.ga.config]
 * @property {Object} [metadata.synonyms]
 * @property {string} metadata.synonyms.value
 * @property {string} [groupType]
 * @property {string[]} [groupNames]
 * @property {Item[]} [members]
 */

/**
 * Metadata
 * @typedef {Object} Metadata
 * @property {string} id
 * @property {string} type
 * @property {string[]} traits
 * @property {Object} name
 * @property {string} name.name
 * @property {string[]} name.defaultNames
 * @property {string[]} name.nicknames
 * @property {boolean} willReportState
 * @property {boolean} [notificationSupportedByAgent]
 * @property {string} [roomHint]
 * @property {Object} [deviceInfo]
 * @property {string} deviceInfo.manufacturer
 * @property {string} deviceInfo.model
 * @property {string} deviceInfo.hwVersion
 * @property {string} deviceInfo.swVersion
 * @property {Object} [attributes]
 * @property {Object} [customData]
 * @property {string} customData.deviceType
 * @property {string} customData.itemType
 * @property {Object} customData.members
 * @property {boolean} [customData.inverted]
 * @property {boolean} [customData.ackNeeded]
 * @property {string} [customData.pinNeeded]
 * @property {boolean} [customData.pinOnDisarmOnly]
 * @property {boolean} [customData.waitForStateChange]
 * @property {object} [customData.colorTemperatureRange]
 * @property {boolean} [customData.useKelvin]
 */

/**
 * Member
 * @typedef {Object} Member
 * @property {string} name
 * @property {string} state
 */

/**
 * Members
 * @typedef {Object.<string, Member>} Members
 */

/**
 * SupportedMember
 * @typedef {Object} SupportedMember
 * @property {string} name
 * @property {string[]} types
 */
