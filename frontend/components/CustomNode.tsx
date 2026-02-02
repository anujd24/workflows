import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }: any) => {
  return (
    <div onClick={data.onClick} className="relative group">
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-2 border-slate-200 rounded-lg shadow-sm w-[300px] hover:border-purple-500 transition-all cursor-pointer">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
           {data.icon ? (
             <img src={data.icon} alt="icon" className="w-8 h-8 object-contain" />
           ) : (
             <div className="text-xl font-bold text-slate-400">
                {data.index}. 
             </div>
           )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {data.isTrigger ? "Trigger" : `Step ${data.index}`}
          </span>
          <span className="font-bold text-slate-900 text-lg line-clamp-1">
            {data.label}
          </span>
        </div>
      </div>

      {!data.isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-4 !h-4 !bg-slate-400 !border-2 !border-white"
        />
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-purple-500 !border-2 !border-white"
      />
    </div>
  );
};

export default memo(CustomNode);