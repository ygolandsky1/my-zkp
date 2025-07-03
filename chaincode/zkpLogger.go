package main
import (
    "encoding/json"
    "fmt"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)
type ZKPLoggerContract struct {
    contractapi.Contract
}
type LogData struct {
    AgentID   string `json:"agentId"`
    Result    string `json:"result"`
    Timestamp string `json:"timestamp"`
    ProofHash string `json:"proofHash"`
}
func (c *ZKPLoggerContract) CreateLog(ctx contractapi.TransactionContextInterface, logID string, logDataJSON string) error {
    fmt.Printf("CreateLog called with logID: %s, logData: %s\n", logID, logDataJSON)
    var logData LogData
    if err := json.Unmarshal([]byte(logDataJSON), &logData); err != nil {
        return fmt.Errorf("failed to unmarshal log data: %v", err)
    }
    logBytes, err := json.Marshal(logData)
    if err != nil {
        return fmt.Errorf("failed to marshal log data: %v", err)
    }
    if err := ctx.GetStub().PutState(logID, logBytes); err != nil {
        return fmt.Errorf("failed to write to ledger: %v", err)
    }
    return nil
}
func (c *ZKPLoggerContract) GetLog(ctx contractapi.TransactionContextInterface, logID string) (string, error) {
    logBytes, err := ctx.GetStub().GetState(logID)
    if err != nil {
        return "", fmt.Errorf("failed to read from ledger: %v", err)
    }
    if logBytes == nil {
        return "", fmt.Errorf("log %s does not exist", logID)
    }
    return string(logBytes), nil
}
func main() {
    chaincode, err := contractapi.NewChaincode(&ZKPLoggerContract{})
    if err != nil {
        fmt.Printf("Error creating chaincode: %v\n", err)
        return
    }
    if err := chaincode.Start(); err != nil {
        fmt.Printf("Error starting chaincode: %v\n", err)
    }
}
