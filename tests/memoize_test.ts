import { assertSpyCalls, memoize, spy } from "./deps.ts";

const noop: () => null = () => null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const incr = (i: number) => (_: unknown): number => i++;

describe("memoize", () => {
  let fn = spy(incr(1));
  let memoized = memoize(fn);
  beforeEach(() => {
    fn = spy(incr(1));
    memoized = memoize(fn);
  });

  it("calls the callback only once with repeated arguments", () => {
    assertEquals([memoized(1), memoized(1), memoized(1), memoized(1)], [
      1,
      1,
      1,
      1,
    ]);
    assertSpyCalls(fn, 1);
  });

  it("differentiates undefined/null/true/0/function", () => {
    const calls = [
      memoized(undefined),
      memoized(null),
      memoized(true),
      memoized(0),
      memoized(noop),
    ];
    assertEquals(calls, [1, 2, 3, 4, 5]);
    assertSpyCalls(fn, 5);
  });

  it("returns the same Promise when called multiple times", () => {
    const memoized = memoize((a) => Promise.resolve(a));
    const p1 = memoized("1");
    const p2 = memoized("1");
    const p3 = memoized("1");
    assertEquals(p1, p2);
    assertEquals(p1, p3);
  });

  // it("does not catch promises as a side-effect", async () => {
  //   let failed = false;
  //   function setFailed() {
  //     failed = true;
  //   }
  //   process.on("unhandledRejection", setFailed);
  //   const error = new Error("Rejected promise");
  //   const memoized = memoize(() => Promise.reject(error));
  //   let rejected = false;
  //   try {
  //     await memoized();
  //   } catch (e) {
  //     if (e === error) {
  //       rejected = true;
  //     } else {
  //       throw e;
  //     }
  //   }
  //   expect(rejected).to.equal(true, "Promise should reject when memoized");
  //   await new Promise(setImmediate);
  //   expect(failed).to.equal(
  //     false,
  //     "Promise should not reject as a side effect",
  //   );
  //   process.off("unhandledRejection", setFailed);
  // });

  // describe("hash", () => {
  //   it("calls hash to get key for cache store", () => {
  //     let key = "1";
  //     const hash = spy(() => key);
  //     memoized = memoize(fn, { hash });
  //     expect([memoized(null), memoized(null)]).to.eql([1, 1]);
  //     expect(fn).to.have.been.called.exactly(1);
  //     expect(hash).to.have.been.called.exactly(2);
  //     expect(hash).to.have.been.called.always.with.exactly(null);
  //     key = "2";
  //     expect(memoized(null)).to.equal(2);
  //     expect(fn).to.have.been.called.exactly(2);
  //   });
  // });

  // describe("cache option", () => {
  //   it("uses `has`/`get`/`set` on the Cache implementation", () => {
  //     const cache = new Map();
  //     spy.on(cache, ["get", "set", "has"]);
  //     const key = {};
  //     const hash = spy(() => key);
  //     memoized = memoize(fn, { hash, cache });
  //     expect([memoized(null), memoized(null)]).to.eql([1, 1]);
  //     expect(cache.has).to.have.been.called.exactly(2).called.with.exactly(key);
  //     expect(cache.get).to.have.been.called.exactly(1).called.with.exactly(key);
  //     expect(cache.set).to.have.been.called.exactly(1).called.with.exactly(
  //       key,
  //       1,
  //     );
  //   });

  //   it("calls `delete` to evict rejected Promises", async () => {
  //     process.on("unhandledRejection", noop);
  //     const cache = new Map();
  //     spy.on(cache, ["get", "set", "has", "delete"]);
  //     const key = {};
  //     const hash = spy(() => key);
  //     const reject = spy(() => Promise.reject(new Error("example")));
  //     memoized = memoize(reject, { hash, cache });
  //     expect(memoized(null)).to.be.a("promise");
  //     expect(cache.set).to.have.been.called.exactly(1).called.with(key);
  //     await Promise.resolve();
  //     expect(cache.delete).to.have.been.called.exactly(1).called.with.exactly(
  //       key,
  //     );
  //     setTimeout(() => process.off("unhandledRejection", noop));
  //   });
  // });
});
