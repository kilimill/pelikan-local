import notifyService from "@/services/notify"

export default function usePrivateNotifications() {
    const notifyMessage = (userId, message) => notifyService.broadcast(userId, message)
    const hostCalledParticipant = userId => notifyMessage(userId, "Ведущий вызвал участника")
    const hostDroppedCall = userId => notifyMessage(userId, "Ведущий завершил вызов")
    const participantResolveCallTimeout = userId => notifyMessage(userId, "Участник не принял вызов в течение 1 мин")
    const participantRejectedCall = userId => notifyMessage(userId, "Участник отказался принять вызов")
    const participantAcceptedCall = userId => notifyMessage(userId, "Участник принял вызов")
    const participantDroppedCall = userId => notifyMessage(userId, "Участник завершил вызов")

    return {
        notifyMessage,
        hostCalledParticipant,
        hostDroppedCall,
        participantResolveCallTimeout,
        participantRejectedCall,
        participantAcceptedCall,
        participantDroppedCall
    }
}