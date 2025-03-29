import { IGameRenderer } from "../rendering/game-renderer";
import { IInputHandler } from "../input/input-handler";
import { IAudioController } from "../audio/audio-controller";
import { IUICoordinator } from "../ui/ui-coordinator";
import { IGameEventCoordinator } from "../events/game-event-coordinator";
import { IGameLogicController } from "../logic/game-logic-controller";
import { GameStateManager } from "../game-state-manager";
import { VehicleManager } from "../../entities/vehicle-manager";
import { ProjectileManager } from "../../systems/projectile-manager";
import { TurnSystem } from "../../systems/turn-system";
import { AimingSystem } from "../../systems/aiming-system";
import { Physics } from "../../systems/physics";
import { Terrain } from "../../systems/terrain";

/**
 * Interface que define todos os sistemas e componentes do jogo
 * que podem ser acessados por diferentes partes do código
 */
export interface GameSystems {
  // Componentes refatorados
  renderer: IGameRenderer;
  inputHandler: IInputHandler;
  audioController: IAudioController;
  uiCoordinator: IUICoordinator;
  eventCoordinator?: IGameEventCoordinator; // Opcional porque é inicializado após o objeto GameSystems ser criado
  logicController?: IGameLogicController; // Opcional porque é inicializado após o objeto GameSystems ser criado
  
  // Sistemas existentes
  gameStateManager: GameStateManager;
  vehicleManager: VehicleManager;
  projectileManager: ProjectileManager;
  turnSystem: TurnSystem;
  aimingSystem: AimingSystem;
  physics: Physics;
  terrain: Terrain;
} 