namespace RepairManagementApi.Enums;

public enum RepairJobStatus
{
    Received,
    Diagnosing,
    Repairing,
    ReadyForPickup,
    Completed,
    Cancelled
}