import { useState } from "react";
import './App.sass';

interface Expense {
  itemName: string;
  batch: string;
  price: number;
}

interface Calculations {
  itemCost: number;
  earning: number;
  earningMarket: number;
}

interface BatchItem { 
  batch: number, 
  qty: number, 
  value: number 
}

function App() {

  const [step, setStep] = useState<number>();
  const [itemCostInMarket, setItemCostInMarket] = useState<string>();
  const [byBatchItems, setByBatchItems] = useState<BatchItem[]>([]);
  const [byBatchItem, setByBatchItem] = useState<BatchItem>({} as BatchItem);
  const [expensesResume, setExpensesResume] = useState<Expense[]>([]);
  const [calculations, setCalculations] = useState<Calculations>({} as Calculations);

  const format = (value: number) => {
    let locale = Intl.NumberFormat('es-CO');
    return locale.format(value);
  }

  const getFullTotal = () => {
    return expensesResume?.reduce((a, s) => a + s.price, 0) || 0;
  }

  const getByBatchItemsTotal = () => {
    return byBatchItems?.reduce((a, s) => a + s.value, 0) || 0;
  }

  const handleCalculateExpenses = (expenses: string) => {
    if (!expenses) {
      setExpensesResume([]);
      return;
    }
    const items = expenses.split('\n').filter(i => !!i);
    const x: Expense[] = items.map(i => {
      const itemName = i.slice(
        i.indexOf('[', 2) + 1,
        i.lastIndexOf(']'),
      );
      
      const batchRegex = /\s[0-9]+ x\s/g;
      const y = i.match(batchRegex);
      const batch = !!y ? y[0] : '';
      
      const regex = /(\d+\s)+kamas/g;
      const prices = i.match(regex)?.map(i => +i.replaceAll(/\s/g, '').replaceAll('kamas', ''));
      const price = prices?.reduce((a, s) => a + s,0) || 0;
      
      const r: Expense = {
        itemName,
        batch,
        price
      };
      return r;
    });
    setExpensesResume(x);
  }

  const handleGetEarnings = () => {
    const itemCost = +(itemCostInMarket || 0);
    const earning = (+itemCost || 0) - (step === 0 ? getFullTotal() : getByBatchItemsTotal());
    const earningMarket = earning - itemCost*0.02;
    setCalculations({ 
      itemCost, 
      earning,
      earningMarket
    });
  }

  const handleCalculateByBatchPrices = () => {
    for (let index = 0; index < (byBatchItem.qty || 1); index++) {
      setByBatchItems(b => [...b, {...byBatchItem, qty: 1}]);
    }
    setByBatchItem({} as BatchItem);
  }

  return (
    <div className="container mt-5">
      <div className="row mb-3">
        <div className="col">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setStep(0)}
          >Gastos</button>
        </div>
        <div className="col">
          <button 
            type="button" 
            className="btn btn-warning"
            onClick={() => setStep(1)}
          >Calculo</button>
        </div>
      </div>
      {step === 0 && (
        <div className="row m-5">
          <div className="col">
            <textarea 
              className="text form-control" 
              placeholder="Items comprados"
              onChange={(e) => handleCalculateExpenses(e.target.value)} 
            />
            <input 
              type="text" 
              className="form-control mt-1" 
              placeholder="Costo del item en venta"
              onChange={(e) => setItemCostInMarket(e.target.value)}
            />
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => handleGetEarnings()}
            >Caclcular</button>
          </div>
          <div className="col">
            {expensesResume.map(i => (
              <div className="row">
                <div className="col-8">{i.itemName}</div>
                <div className="col-2">{i.batch}</div>
                <div className="col-2">{format(i.price)}</div>
              </div>
            ))}
            <div className="row">
              <div className="col-8">Total:</div>
              <div className="col-2" />
              <div className="col-2">{format(getFullTotal())}</div>
            </div>
            <div className="row">
              <div className="col-8">Costo item:</div>
              <div className="col-2" />
              <div className="col-2">{format(calculations.itemCost || 0)}</div>
            </div>
            <div className="row">
              <div className="col-8">Ganancia:</div>
              <div className="col-2" />
              <div className="col-2">{format(calculations.earning || 0)}</div>
            </div>
            <div className="row">
              <div className="col-8">Ganancia mercadillo:</div>
              <div className="col-2" />
              <div className="col-2">{format(calculations.earningMarket || 0)}</div>
            </div>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="row m-5">
          <div className="col">
            <div className="input-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Cantidad" 
                value={byBatchItem.qty || ''}
                onChange={(e) => setByBatchItem(i => ({...i, qty: +e.target.value }))}
              />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Lote" 
                value={byBatchItem.batch || ''}
                onChange={(e) => setByBatchItem(i => ({...i, batch: +e.target.value }))}
              />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Valor" 
                value={byBatchItem.value || ''}
                onChange={(e) => setByBatchItem(i => ({...i, value: +e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculateByBatchPrices()}
              />
              <button 
                className="btn btn-secondary" 
                type="button" 
                onClick={handleCalculateByBatchPrices}
              >+</button>
            </div>
            <input 
              type="text" 
              className="form-control mt-1" 
              placeholder="Costo del item en venta"
              onChange={(e) => setItemCostInMarket(e.target.value)}
            />
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => handleGetEarnings()}
            >Caclcular</button>
          </div>
          <div className="col">
            {byBatchItems.map(i => (
              <div className="row">
                <div className="col-2">{i.qty}x</div>
                <div className="col-8">{i.batch}</div>
                <div className="col-2">{format(i.value)}</div>
              </div>
            ))}
            <div className="row">
              <div className="col-8">Total:</div>
              <div className="col-2" />
              <div className="col-2">{format(getByBatchItemsTotal())}</div>
            </div>
            <div className="row">
              <div className="col-8">Costo item:</div>
              <div className="col-2" />
              <div className="col-2">{format(calculations.itemCost || 0)}</div>
            </div>
            <div className="row">
              <div className="col-8">Ganancia:</div>
              <div className="col-2" />
              <div className="col-2">{format(calculations.earning || 0)}</div>
            </div>
            <div className="row">
              <div className="col-8">Ganancia mercadillo:</div>
              <div className="col-2" />
              <div className="col-2">{format(calculations.earningMarket || 0)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
