import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css'
 
export default function App(){

  const inputRef = useRef<HTMLInputElement>(null)
  const primeiraRend = useRef(true)  //Com esse status consigo ordenar os useEffect

  const [valores, setValores] = useState("")
  const [tarefas, setTarefas] = useState<string[]>([])

  const [edicao, setEdicao] = useState({
    ativo: false,
    tarefa:''
  })

  useEffect(() => { //UseEffect ajuda a aplicação a focar em renderizações, sempre que o valor de referência sofrer alterações

    const tarefasSalvas = localStorage.getItem("@projectreact")     //Necessário para executar primeiro e não apagar dados do useEffect anterior
    
    if(tarefasSalvas){
      setTarefas(JSON.parse(tarefasSalvas))
    }

  }, [])   //Sem valor, renderizará no início da aplicação

  useEffect(() => { // UseEffect renderiza sempre que o valor mudar e executa seu código interno
    
    if(primeiraRend.current){
      primeiraRend.current = false; 
      return;
    }

    localStorage.setItem("@projectreact", JSON.stringify(tarefas))

  }, [tarefas]) // Sempre com uma nova tarefa irá renderizar



  const registrador = useCallback( () => { //Callback usado para melhorar performance, evitando renderização desnecessária.

    if(!valores){
      return
    }

    if(edicao.ativo){
      salvarEdicao();
      return
    }

    setTarefas( tarefas => [...tarefas, valores])
    setValores("")

  },[valores, tarefas]) //Referencia valores que dispara a função

  function salvarEdicao(){
    const acharIndexTarefa = tarefas.findIndex( tarefa => tarefa === edicao.tarefa)
    const todasTarefas = [...tarefas]

    todasTarefas[acharIndexTarefa] = valores;
    setTarefas(todasTarefas);

    setEdicao({
      ativo: false,
      tarefa: ''
    })

    setValores("")

  }
  function excluir(item: string){
    const removerTarefa = tarefas.filter(tarefa => tarefa !== item)
    setTarefas(removerTarefa)
  }
  function editar(item: string){

    inputRef.current?.focus(); //Ao clicar em editar, o foco vai direto para a barra de edição

    setValores(item)
    setEdicao({
      ativo: true,
      tarefa: item
    })

  }
  const totalTarefas = useMemo(() => {  // Evita renderizações totais desnecessárias, aumentando a eficiência da aplicação.
    return tarefas.length               // Simples e eficiente.
  }, [tarefas])                         // Referência dos valores atualizados em tempo real.

  return(

    <div className='container'>

        <div className='header'>
          <h2 className='title'> Lista de Tarefas </h2>
          { totalTarefas > 0 && totalTarefas < 2 && <h3 className='contador'> Você tem {totalTarefas} tarefa pendente </h3> }
          { totalTarefas > 1 && <h3 className='contador'> Você tem {totalTarefas} tarefas pendentes </h3> }
        </div>
        

      <div className='inputInfo'>
        <input placeholder='Digite a tarefa a ser adicionada'
        className='input'
        value={valores}
        onChange={(e) => setValores(e.target.value)}
        ref={inputRef} //Referência de valores de entrada, facilita o resgaste de dados para a aplicação
        />
        <button className='button' onClick={registrador}> 
            { edicao.ativo ? "Atualizar Tarefa" : "Adicionar Tarefa"}
           </button>
      </div>

      {tarefas.map((item) => (
        <section key={item} className='stickers'>

          <div className='info'>
          <span>{item}</span>
          </div>

          <div className='actionButtons'>
          <button className='editar' onClick={() => editar(item)}>Editar</button>
          <button className='excluir' onClick={() => excluir(item)}>Excluir</button>
          </div>

        </section>
      ))}

   </div>

)


}
