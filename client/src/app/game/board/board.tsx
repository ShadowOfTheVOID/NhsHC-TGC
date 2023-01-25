import {useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'
import {RootState} from 'store'
import HealthBar from 'components/health-bar'
import Coin from 'components/coin'
import {GameState, PlayerState, BoardRowT, CardT} from 'types/game-state'
import css from './board.module.css'
import Slot from './board-slot'
import BoardRow from './board-row'

/*
TODO:
- Indicate when it is players turn
	- Don't allow clicking on slots on the other side
*/

type Props = {
	onClick: (meta: any) => void
	gameState: GameState
}

// TODO - Use selecotrs instead of passing gameState
function Board({onClick, gameState}: Props) {
	const playerId = useSelector((state: RootState) => state.playerId)
	const boardState = gameState.players[gameState.turnPlayerId].board
	const singleUseCard = boardState.singleUseCard
	const singleUseCardUsed = boardState.singleUseCardUsed
	const currentPlayer = useSelector((state: RootState) => {
		if (!state.gameState) return null
		const {players, turnPlayerId} = state.gameState
		return players[turnPlayerId]
	})

	const availableActions = useSelector(
		(state: RootState) => state.availableActions
	)
	const dispatch = useDispatch()

	const [coinFlip, setCoinFlip] = useState<string | null>(null)
	useEffect(() => {
		setCoinFlip(currentPlayer?.coinFlip || null)
		const timeout = setTimeout(() => {
			setCoinFlip(null)
		}, 3000)
		return () => clearTimeout(timeout)
	}, [currentPlayer?.coinFlip])

	const handeRowClick = (
		playerId: string,
		rowIndex: number,
		rowState: BoardRowT | null,
		meta: any
	) => {
		onClick({
			...meta,
			playerId,
			rowIndex,
			rowHermitCard: rowState?.hermitCard || null,
		})
	}

	const endTurn = () => {
		dispatch({type: 'END_TURN'})
	}

	const makeRows = (playerState: PlayerState, type: 'left' | 'right') => {
		const rows = playerState.board.rows
		return new Array(5).fill(null).map((_, index) => {
			if (!rows[index]) throw new Error('Rendering board row failed')
			return (
				<BoardRow
					key={index}
					rowState={rows[index]}
					active={index === playerState.board.activeRow}
					onClick={handeRowClick.bind(null, playerState.id, index, rows[index])}
					type={type}
				/>
			)
		})
	}

	const [player1, player2] = gameState.order.map(
		(playerId) => gameState.players[playerId]
	)
	return (
		<div className={css.board}>
			<div className={css.leftPlayer}>
				<div className={css.playerInfo}>
					<div className={css.playerName}>{player1.playerName}</div>
					{gameState.turnPlayerId === player1.id ? (
						<div className={css.currentTurn}>
							{gameState.turnPlayerId === playerId
								? 'Your turn'
								: "Opponent's turn"}
						</div>
					) : null}
					<div className={css.dynamicSpace} />
					<HealthBar lives={player1.lives} />
				</div>
				{makeRows(player1, 'left')}
			</div>

			<div className={css.middle}>
				<img src="images/tcg1.png" draggable="false" width="100" />
				{coinFlip ? (
					<Coin face={coinFlip} />
				) : !availableActions.includes('WAIT_FOR_TURN') ? (
					<button
						onClick={endTurn}
						disabled={!availableActions.includes('END_TURN')}
					>
						End Turn
					</button>
				) : null}
				<div
					className={classnames(css.singleUseSlot, {
						[css.used]: singleUseCardUsed,
					})}
				>
					<Slot
						onClick={() => onClick({slotType: 'single_use'})}
						cardId={singleUseCard ? singleUseCard.cardId : null}
						type={'single_use'}
					/>
				</div>
			</div>
			<div className={css.rightPlayer}>
				<div className={css.playerInfo}>
					<HealthBar lives={player2.lives} />
					<div className={css.dynamicSpace} />
					{gameState.turnPlayerId === player2.id ? (
						<div className={css.currentTurn}>
							{gameState.turnPlayerId === playerId
								? 'Your turn'
								: "Opponent's turn"}
						</div>
					) : null}
					<div className={css.playerName}>{player2.playerName}</div>
				</div>
				{makeRows(player2, 'right')}
			</div>
		</div>
	)
}

export default Board
