export function asyncMap(arr: any[], asyncFn: any) {
  return Promise.all(arr.map(asyncFn));
}
