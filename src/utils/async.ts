// https://gist.github.com/Lukasz-pluszczewski/f118564db970dcc9af151cbe7442f759
export const Break = Symbol('BreakSymbol')
type BreakSymbol = typeof Break

export async function asyncForEach<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<void | BreakSymbol>): Promise<void> {
  for (let i = 0; i < array.length; i++) {
    const iterationResult = await callback(array[i], i, array)
    if (iterationResult === Break) {
      break
    }
  }
}
