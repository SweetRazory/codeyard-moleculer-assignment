type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

declare type StatusCode<F extends number = 100, T extends number = 599> = Exclude<Enumerate<T>, Enumerate<F>>